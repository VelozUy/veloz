'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFontSwitcher } from '@/hooks/useFontSwitcher';

export default function FontSwitcher() {
  const [isVisible, setIsVisible] = useState(false);
  const {
    currentFont,
    changeFont,
    resetToDefault,
    getCurrentFontInfo,
    availableFonts,
  } = useFontSwitcher();

  return (
    <>
      {/* Floating toggle button */}
      <Button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 left-4 z-50 shadow-lg"
        variant="outline"
        size="sm"
      >
        {isVisible ? 'Hide' : 'Font'} Switcher
      </Button>

      {/* Font switcher panel */}
      {isVisible && (
        <Card className="fixed bottom-16 left-4 z-50 w-80 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Quick Font Switcher</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Font selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Select Font
              </label>
              <Select value={currentFont} onValueChange={changeFont}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableFonts.map(font => (
                    <SelectItem key={font.name} value={font.name}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Preview
              </label>
              <div
                className="p-3 border rounded-md text-sm"
                style={{
                  fontFamily: `'${currentFont}', sans-serif`,
                  fontWeight: getCurrentFontInfo()?.weight || 400,
                  fontStyle: getCurrentFontInfo()?.style || 'normal',
                }}
              >
                <div className="font-semibold mb-1">Sample Title</div>
                <div>
                  This is how your content will look with the selected font. The
                  quick brown fox jumps over the lazy dog.
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={resetToDefault}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Reset to Default
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                size="sm"
                className="flex-1"
              >
                Close
              </Button>
            </div>

            {/* Current font info */}
            <div className="text-xs text-muted-foreground pt-2 border-t">
              <div>Current: {currentFont}</div>
              <div>Weight: {getCurrentFontInfo()?.weight}</div>
              <div>Style: {getCurrentFontInfo()?.style}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
