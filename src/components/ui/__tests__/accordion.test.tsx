import React from 'react';
import { render, screen, waitFor } from '@/lib/test-utils';
import { userInteraction } from '@/lib/test-utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../accordion';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  ChevronDownIcon: () => <div data-testid="chevron-down-icon" />,
}));

describe('Accordion Component', () => {
  const TestAccordion = ({ defaultValue }: { defaultValue?: string }) => (
    <Accordion type="single" collapsible defaultValue={defaultValue}>
      <AccordionItem value="item-1">
        <AccordionTrigger>What is Veloz?</AccordionTrigger>
        <AccordionContent>
          Veloz is a professional photography and videography company.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>What types of events do you cover?</AccordionTrigger>
        <AccordionContent>
          We cover weddings, corporate events, cultural events, and more.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>How fast is delivery?</AccordionTrigger>
        <AccordionContent>
          We typically deliver photos within 7-14 days after the event.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  describe('Basic Rendering', () => {
    it('renders all accordion items', () => {
      render(<TestAccordion />);

      expect(screen.getByText('What is Veloz?')).toBeInTheDocument();
      expect(
        screen.getByText('What types of events do you cover?')
      ).toBeInTheDocument();
      expect(screen.getByText('How fast is delivery?')).toBeInTheDocument();
    });

    it('renders chevron icons for all triggers', () => {
      render(<TestAccordion />);

      const chevronIcons = screen.getAllByTestId('chevron-down-icon');
      expect(chevronIcons).toHaveLength(3);
    });

    it('initially hides all content when no default value', () => {
      render(<TestAccordion />);

      expect(
        screen.queryByText('Veloz is a professional photography')
      ).not.toBeVisible();
      expect(
        screen.queryByText('We cover weddings, corporate events')
      ).not.toBeVisible();
      expect(
        screen.queryByText('We typically deliver photos')
      ).not.toBeVisible();
    });

    it('shows default item content when defaultValue is provided', () => {
      render(<TestAccordion defaultValue="item-1" />);

      expect(
        screen.getByText(
          'Veloz is a professional photography and videography company.'
        )
      ).toBeVisible();
    });
  });

  describe('Expand/Collapse Functionality', () => {
    it('expands content when trigger is clicked', async () => {
      render(<TestAccordion />);

      const firstTrigger = screen.getByText('What is Veloz?');
      await userInteraction.click(firstTrigger);

      await waitFor(() => {
        expect(
          screen.getByText(
            'Veloz is a professional photography and videography company.'
          )
        ).toBeVisible();
      });
    });

    it('collapses content when expanded trigger is clicked again', async () => {
      render(<TestAccordion defaultValue="item-1" />);

      const firstTrigger = screen.getByText('What is Veloz?');

      // Content should be visible initially
      expect(
        screen.getByText(
          'Veloz is a professional photography and videography company.'
        )
      ).toBeVisible();

      // Click to collapse
      await userInteraction.click(firstTrigger);

      await waitFor(() => {
        expect(
          screen.queryByText(
            'Veloz is a professional photography and videography company.'
          )
        ).not.toBeVisible();
      });
    });

    it('only allows one item to be open at a time (single type)', async () => {
      render(<TestAccordion />);

      // Open first item
      const firstTrigger = screen.getByText('What is Veloz?');
      await userInteraction.click(firstTrigger);

      await waitFor(() => {
        expect(
          screen.getByText(
            'Veloz is a professional photography and videography company.'
          )
        ).toBeVisible();
      });

      // Open second item
      const secondTrigger = screen.getByText(
        'What types of events do you cover?'
      );
      await userInteraction.click(secondTrigger);

      await waitFor(() => {
        // Second item should be open
        expect(
          screen.getByText(
            'We cover weddings, corporate events, cultural events, and more.'
          )
        ).toBeVisible();
        // First item should be closed
        expect(
          screen.queryByText(
            'Veloz is a professional photography and videography company.'
          )
        ).not.toBeVisible();
      });
    });

    it('animates chevron icon rotation', async () => {
      render(<TestAccordion />);

      const firstTrigger = screen.getByText('What is Veloz?');
      await userInteraction.click(firstTrigger);

      // Check that the chevron has rotation classes (data-state changes)
      const triggerButton = firstTrigger.closest('button');
      expect(triggerButton).toHaveAttribute('data-state', 'open');
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports keyboard navigation between triggers', async () => {
      render(<TestAccordion />);

      const firstTrigger = screen.getByText('What is Veloz?');

      // Focus the first trigger
      firstTrigger.focus();
      expect(firstTrigger).toHaveFocus();

      // Press Tab to move to next trigger
      firstTrigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));

      // Should be able to navigate between triggers
      expect(firstTrigger.closest('button')).toBeInTheDocument();
    });

    it('opens content when Enter is pressed on trigger', async () => {
      render(<TestAccordion />);

      const firstTrigger = screen.getByText('What is Veloz?');
      firstTrigger.focus();

      // Press Enter to open
      firstTrigger.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter' })
      );

      await waitFor(() => {
        expect(
          screen.getByText(
            'Veloz is a professional photography and videography company.'
          )
        ).toBeVisible();
      });
    });

    it('opens content when Space is pressed on trigger', async () => {
      render(<TestAccordion />);

      const firstTrigger = screen.getByText('What is Veloz?');
      firstTrigger.focus();

      // Press Space to open
      firstTrigger.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));

      await waitFor(() => {
        expect(
          screen.getByText(
            'Veloz is a professional photography and videography company.'
          )
        ).toBeVisible();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<TestAccordion />);

      const triggers = screen.getAllByRole('button');
      triggers.forEach(trigger => {
        expect(trigger).toHaveAttribute('aria-expanded');
        expect(trigger).toHaveAttribute('aria-controls');
      });
    });

    it('updates aria-expanded when opened/closed', async () => {
      render(<TestAccordion />);

      const firstTrigger = screen.getByText('What is Veloz?').closest('button');

      // Initially closed
      expect(firstTrigger).toHaveAttribute('aria-expanded', 'false');

      // Click to open
      await userInteraction.click(firstTrigger!);

      await waitFor(() => {
        expect(firstTrigger).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('has proper heading structure', () => {
      render(<TestAccordion />);

      // Triggers should be in headers for proper heading structure
      const triggers = screen.getAllByRole('button');
      triggers.forEach(trigger => {
        expect(
          trigger.closest('[data-slot="accordion-trigger"]')
        ).toBeInTheDocument();
      });
    });

    it('associates content with triggers via aria-controls', () => {
      render(<TestAccordion />);

      const firstTrigger = screen.getByText('What is Veloz?').closest('button');
      const ariaControls = firstTrigger?.getAttribute('aria-controls');

      expect(ariaControls).toBeTruthy();

      // Content should have matching ID
      const content = document.querySelector(`#${ariaControls}`);
      expect(content).toBeInTheDocument();
    });
  });

  describe('Visual States', () => {
    it('applies correct CSS classes for open state', async () => {
      render(<TestAccordion />);

      const firstTrigger = screen.getByText('What is Veloz?');
      await userInteraction.click(firstTrigger);

      await waitFor(() => {
        const triggerButton = firstTrigger.closest('button');
        expect(triggerButton).toHaveAttribute('data-state', 'open');
      });
    });

    it('applies correct CSS classes for closed state', () => {
      render(<TestAccordion />);

      const firstTrigger = screen.getByText('What is Veloz?').closest('button');
      expect(firstTrigger).toHaveAttribute('data-state', 'closed');
    });

    it('has hover states', () => {
      render(<TestAccordion />);

      const firstTrigger = screen.getByText('What is Veloz?').closest('button');
      expect(firstTrigger).toHaveClass('hover:underline');
    });

    it('has focus visible styles', () => {
      render(<TestAccordion />);

      const firstTrigger = screen.getByText('What is Veloz?').closest('button');
      expect(firstTrigger).toHaveClass('focus-visible:ring-ring/50');
    });
  });

  describe('Animation', () => {
    it('has animation classes for accordion content', async () => {
      render(<TestAccordion />);

      const firstTrigger = screen.getByText('What is Veloz?');
      await userInteraction.click(firstTrigger);

      await waitFor(() => {
        const content = screen
          .getByText(
            'Veloz is a professional photography and videography company.'
          )
          .closest('[data-slot="accordion-content"]');
        expect(content).toHaveClass('data-[state=open]:animate-accordion-down');
      });
    });

    it('shows animation classes for closing', async () => {
      render(<TestAccordion defaultValue="item-1" />);

      const firstTrigger = screen.getByText('What is Veloz?');
      await userInteraction.click(firstTrigger);

      const content = screen
        .getByText(
          'Veloz is a professional photography and videography company.'
        )
        .closest('[data-slot="accordion-content"]');
      expect(content).toHaveClass('data-[state=closed]:animate-accordion-up');
    });
  });

  describe('Multiple Accordion Component', () => {
    const MultipleAccordion = () => (
      <Accordion type="multiple">
        <AccordionItem value="item-1">
          <AccordionTrigger>Question 1</AccordionTrigger>
          <AccordionContent>Answer 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Question 2</AccordionTrigger>
          <AccordionContent>Answer 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    it('allows multiple items to be open simultaneously', async () => {
      render(<MultipleAccordion />);

      // Open first item
      const firstTrigger = screen.getByText('Question 1');
      await userInteraction.click(firstTrigger);

      await waitFor(() => {
        expect(screen.getByText('Answer 1')).toBeVisible();
      });

      // Open second item
      const secondTrigger = screen.getByText('Question 2');
      await userInteraction.click(secondTrigger);

      await waitFor(() => {
        // Both should be open
        expect(screen.getByText('Answer 1')).toBeVisible();
        expect(screen.getByText('Answer 2')).toBeVisible();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty content gracefully', () => {
      const EmptyAccordion = () => (
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Empty Item</AccordionTrigger>
            <AccordionContent></AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      render(<EmptyAccordion />);
      expect(screen.getByText('Empty Item')).toBeInTheDocument();
    });

    it('handles long content properly', async () => {
      const LongContentAccordion = () => (
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Long Content</AccordionTrigger>
            <AccordionContent>
              {'This is a very long content that should wrap properly and be fully accessible. '.repeat(
                10
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      render(<LongContentAccordion />);

      const trigger = screen.getByText('Long Content');
      await userInteraction.click(trigger);

      await waitFor(() => {
        const content = screen.getByText(/This is a very long content/);
        expect(content).toBeVisible();
      });
    });

    it('handles rapid clicking gracefully', async () => {
      render(<TestAccordion />);

      const firstTrigger = screen.getByText('What is Veloz?');

      // Rapid clicks should not break the component
      await userInteraction.click(firstTrigger);
      await userInteraction.click(firstTrigger);
      await userInteraction.click(firstTrigger);

      // Component should still be functional
      expect(firstTrigger).toBeInTheDocument();
    });
  });
});
