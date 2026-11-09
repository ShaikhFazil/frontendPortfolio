'use client';

import ResourceManager, { type ResourceConfig } from '@/components/dashboard/resource-manager';
import { Badge } from '@/components/ui/misc';
import type { Project } from '@/lib/types';

const CATEGORIES = [
  'Web Platform',
  'Generative AI',
  'E-commerce',
  'Fintech',
  'Internal Tooling',
  'Marketing Site',
  'Web App',
];

const config: ResourceConfig<Project & { _id?: string }> = {
  endpoint: '/projects',
  singular: 'Project',
  plural: 'Projects',
  description:
    'Featured projects appear as large tiles on the homepage; the rest are listed under them. Each project also gets its own page.',
  searchPlaceholder: 'Search by title, stack or category',
  defaults: {
    title: '',
    summary: '',
    description: '',
    category: 'Web App',
    technologies: [],
    features: [],
    thumbnail: { url: '', publicId: '' },
    images: [],
    liveUrl: '',
    githubUrl: '',
    year: '',
    featured: false,
    published: true,
  },
  filters: [
    { key: 'category', label: 'Category', options: CATEGORIES.map((c) => ({ value: c, label: c })) },
    {
      key: 'featured',
      label: 'Featured',
      options: [
        { value: 'true', label: 'Featured only' },
        { value: 'false', label: 'Not featured' },
      ],
    },
  ],
  fields: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'category', label: 'Category', type: 'select', options: CATEGORIES },
    {
      name: 'summary',
      label: 'Short summary',
      type: 'textarea',
      rows: 2,
      hint: 'One sentence. Shown on the project card and used for search results.',
    },
    { name: 'description', label: 'Full description', type: 'textarea', rows: 6 },
    { name: 'technologies', label: 'Tech stack', type: 'tags', placeholder: 'React.js, Node.js' },
    { name: 'features', label: 'Key features', type: 'tags', placeholder: 'Add a feature and press Enter' },
    { name: 'thumbnail', label: 'Thumbnail', type: 'image', folder: 'projects' },
    { name: 'images', label: 'Screenshots', type: 'gallery', folder: 'projects' },
    { name: 'liveUrl', label: 'Live demo URL', type: 'url' },
    { name: 'githubUrl', label: 'GitHub URL', type: 'url' },
    { name: 'year', label: 'Year', type: 'text', placeholder: '2025' },
    { name: 'featured', label: 'Feature on the homepage', type: 'switch' },
    { name: 'published', label: 'Show on the public site', type: 'switch' },
  ],
  columns: [
    { key: 'title', label: 'Title', render: (row) => <span className="font-medium">{row.title}</span> },
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

export default function ProjectsPage() {
  return <ResourceManager config={config} />;
}
