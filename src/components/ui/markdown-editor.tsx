'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  rows?: number;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Escribe tu contenido en Markdown...',
  label,
  className,
  rows = 10,
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering for preview
    return text
      .replace(
        /^### (.*$)/gim,
        '<h3 class="text-lg font-semibold mb-2">$1</h3>'
      )
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(
        /`(.*?)`/gim,
        '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>'
      )
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/gim,
        '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
      )
      .replace(/\n\n/gim, '</p><p class="mb-3">')
      .replace(/^(.+)$/gim, '<p class="mb-3">$1</p>');
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Type className="h-4 w-4" />
              Editor de Markdown
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2"
            >
              {showPreview ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Editar
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Vista Previa
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {showPreview ? (
            <div
              className="prose prose-sm max-w-none min-h-[200px] p-4 border rounded-md bg-muted/50"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
            />
          ) : (
            <Textarea
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder={placeholder}
              rows={rows}
              className="font-mono text-sm"
            />
          )}

          {!showPreview && (
            <div className="mt-2 text-xs text-muted-foreground">
              <p className="mb-1">
                <strong>Sintaxis Markdown:</strong>
              </p>
              <p># Título 1 | ## Título 2 | ### Título 3</p>
              <p>**negrita** | *cursiva* | `código` | [texto](url)</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
