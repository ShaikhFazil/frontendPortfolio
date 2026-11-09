'use client';

import ResourceManager, { type ResourceConfig } from '@/components/dashboard/resource-manager';
import type { Education } from '@/lib/types';

const config: ResourceConfig<Education & { _id?: string }> = {
  endpoint: '/education',
  singular: 'Entry',
  plural: 'Education',
  description: 'Degrees, diplomas and courses, shown in display order on the public site.',
  searchPlaceholder: 'Search by institution or qualification',
  defaults: {
    institution: '',
    qualification: '',
    field: '',
    startYear: '',
    endYear: '',
    grade: '',
    description: '',
    published: true,
  },
  fields: [
    { name: 'qualification', label: 'Qualification', type: 'text', required: true },
    { name: 'institution', label: 'Institution', type: 'text', required: true },
    { name: 'field', label: 'Field of study', type: 'text' },
    { name: 'startYear', label: 'Start', type: 'text', placeholder: 'Aug 2020' },
    { name: 'endYear', label: 'End', type: 'text', placeholder: 'May 2023' },
    { name: 'grade', label: 'Grade', type: 'text' },
    { name: 'description', label: 'Notes', type: 'textarea', rows: 3 },
    { name: 'published', label: 'Show on the public site', type: 'switch' },
  ],
  columns: [
    {
      key: 'qualification',
      label: 'Qualification',
      render: (row) => <span className="font-medium">{row.qualification}</span>,
    },
    {
      key: 'institution',
      label: 'Institution',
      render: (row) => <span className="text-muted-foreground">{row.institution}</span>,
    },
    {
      key: 'endYear',
      label: 'Years',
      render: (row) => (
        <span className="font-mono text-xs text-muted-foreground">
          {[row.startYear, row.endYear].filter(Boolean).join(' - ')}
        </span>
      ),
    },
  ],
};

export default function EducationPage() {
  return <ResourceManager config={config} />;
}
