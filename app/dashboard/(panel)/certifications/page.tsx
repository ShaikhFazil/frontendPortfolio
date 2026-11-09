'use client';

import ResourceManager, { type ResourceConfig } from '@/components/dashboard/resource-manager';
import { Badge } from '@/components/ui/misc';
import type { Certification } from '@/lib/types';

const config: ResourceConfig<Certification & { _id?: string }> = {
  endpoint: '/certifications',
  singular: 'Item',
  plural: 'Certifications',
  description:
    'Certifications and achievements. The public site lists them in two separate groups.',
  searchPlaceholder: 'Search by name or issuer',
  defaults: {
    name: '',
    issuer: '',
    issueDate: '',
    credentialId: '',
    credentialUrl: '',
    kind: 'certification',
    published: true,
  },
  filters: [
    {
      key: 'kind',
      label: 'Type',
      options: [
        { value: 'certification', label: 'Certification' },
        { value: 'achievement', label: 'Achievement' },
      ],
    },
  ],
  fields: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'kind', label: 'Type', type: 'select', required: true, options: ['certification', 'achievement'] },
    { name: 'issuer', label: 'Issuer', type: 'text' },
    { name: 'issueDate', label: 'Issued', type: 'text', placeholder: 'Jun 2024' },
    { name: 'credentialId', label: 'Credential ID', type: 'text' },
    { name: 'credentialUrl', label: 'Credential URL', type: 'url' },
    { name: 'published', label: 'Show on the public site', type: 'switch' },
  ],
  columns: [
    { key: 'name', label: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
    {
      key: 'issuer',
      label: 'Issuer',
      render: (row) => <span className="text-muted-foreground">{row.issuer || '-'}</span>,
    },
    {
      key: 'kind',
      label: 'Type',
      render: (row) => (
        <Badge tone={row.kind === 'achievement' ? 'warning' : 'neutral'}>{row.kind}</Badge>
      ),
    },
  ],
};

export default function CertificationsPage() {
  return <ResourceManager config={config} />;
}
