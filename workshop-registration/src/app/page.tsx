import { redirect } from 'next/navigation';
import { DEFAULT_WORKSHOP_SLUG } from '@/config/workshops';

/**
 * Home page - Redirect to default workshop registration
 *
 * For multi-workshop setup, this could display a list of active workshops
 * For now, redirects to the default workshop
 */
export default function Home() {
  redirect(`/${DEFAULT_WORKSHOP_SLUG}/registration`);
}
