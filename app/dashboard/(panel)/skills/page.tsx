'use client';

import ResourceManager, { type ResourceConfig } from '@/components/dashboard/resource-manager';
import { Badge } from '@/components/ui/misc';
import { SKILL_CATEGORIES, type Skill } from '@/lib/types';

const config: ResourceConfig<Skill & { _id?: string }> = {
  endpoint: '/skills',
  singular: 'Skill',
  plural: 'Skills',
  description:
    'Grouped into categories on the public site. Featured skills are highlighted inside their category.',
  searchPlaceholder: 'Search by name or category',
  defaults: { name: '', category: 'Frontend', level: 0, featured: false, published: true, iconUrl: '' },
  filters: [
    {
      key: 'category',
      label: 'Category',
      options: SKILL_CATEGORIES.map((c) => ({ value: c, label: c })),
    },
  ],
  fields: [
    { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'LangGraph' },
    { name: 'category', label: 'Category', type: 'select', required: true, options: [...SKILL_CATEGORIES] },
    {
      name: 'level',
      label: 'Confidence (0-100)',
      type: 'number',
      hint: 'Optional. Leave at 0 to hide any level indicator.',
    },
    { name: 'iconUrl', label: 'Icon URL', type: 'url', hint: 'Optional link to an SVG or PNG icon.' },
    { name: 'featured', label: 'Highlight this skill', type: 'switch' },
    { name: 'published', label: 'Show on the public site', type: 'switch' },
  ],
  columns: [
    { key: 'name', label: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
    {
      key: 'category',
      label: 'Category',
      render: (row) => <span className="text-muted-foreground">{row.category}</span>,
    },
    {
      key: 'featured',
      label: 'Featured',
      render: (row) => (row.featured ? <Badge tone="accent">Featured</Badge> : null),
    },
  ],
};

export default function SkillsPage() {
  return <ResourceManager config={config} />;
}
