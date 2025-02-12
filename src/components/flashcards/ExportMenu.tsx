import React from 'react';
import { FileText } from 'lucide-react';
import { Button } from '../ui/button';

interface ExportMenuProps {
  onExport: (format: 'pdf') => void;
}

export function ExportMenu({ onExport }: ExportMenuProps) {
  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        className="gap-2"
        onClick={() => onExport('pdf')}
      >
        <FileText className="h-4 w-4" />
        Export PDF
      </Button>
    </div>
  );
}