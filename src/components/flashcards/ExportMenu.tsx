import React from 'react';
import { FileDown, FileText, Database } from 'lucide-react';
import { Button } from '../ui/button';

interface ExportMenuProps {
  onExport: (format: 'pdf' | 'csv' | 'anki') => void;
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
      <Button 
        variant="outline" 
        className="gap-2"
        onClick={() => onExport('csv')}
      >
        <FileDown className="h-4 w-4" />
        Export CSV
      </Button>
      <Button 
        variant="outline" 
        className="gap-2"
        onClick={() => onExport('anki')}
      >
        <Database className="h-4 w-4" />
        Export to Anki
      </Button>
    </div>
  );
}