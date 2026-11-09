'use client';

import ResourceManager, { type ResourceConfig } from '@/components/dashboard/resource-manager';
import { Badge } from '@/components/ui/misc';
import type { Experience } from '@/lib/types';

const config: ResourceConfig<Experience & { _id?: string }> = {
  endpoint: '/experience',
  singular: 'Role',
  plural: 'Experience',
  description: 'Each role renders as an entry on the public timeline, newest first by display order.',
  searchPlaceholder: 'Search by company or role',
  defaults: {
    company: '',
    role: '',
    location: '',
    employmentType: 'Full-time',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    achievements: [],
    technologies: [],
    companyUrl: '',
    companyLogo: { url: '', publicId: '' },
    published: true,
  },
  fields: [
    { name: 'role', label: 'Job title', type: 'text', required: true, placeholder: 'Full Stack Developer' },
    { name: 'company', label: 'Company', type: 'text', required: true, placeholder: 'The Hosteller' },
    { name: 'location', label: 'Location', type: 'text', placeholder: 'Mumbai, India' },
    { name: 'employmentType', label: 'Employment type', type: 'text', placeholder: 'Full-time' },
    { name: 'startDate', label: 'Start date', type: 'text', required: true, placeholder: 'Mar 2025' },
    { name: 'endDate', label: 'End date', type: 'text', placeholder: 'Leave empty if current' },
    { name: 'current', label: 'This is my current role', type: 'switch' },
    { name: 'description', label: 'Summary', type: 'textarea', rows: 3 },
    {
      name: 'achievements',
      label: 'Achievements',
      type: 'tags',
      placeholder: 'Add one achievement and press Enter',
      hint: 'Each becomes a bullet under the role.',
    },
    { name: 'technologies', label: 'Technologies', type: 'tags', placeholder: 'React.js, Node.js' },
    { name: 'companyUrl', label: 'Company website', type: 'url' },
    { name: 'companyLogo', label: 'Company logo', type: 'image', folder: 'experience' },
    { name: 'published', label: 'Show on the public site', type: 'switch' },
  ],
  columns: [
    { key: 'role', label: 'Role', render: (row) => <span className="font-medium">{row.role}</span> },
    {
      key: 'company',
      label: 'Company',
      render: (row) => <span className="text-muted-foreground">{row.company}</span>,
    },
    {
      key: 'current',
      label: 'Period',
      render: (row) =>
        row.current ? (
          <Badge tone="accent">Current</Badge>
        ) : (
          <span className="font-mono text-xs text-muted-foreground">
            {row.startDate} - {row.endDate || 'Present'}
          </span>
        ),
    },
  ],
};

export default function ExperiencePage() {
  return <ResourceManager config={config} />;
}
