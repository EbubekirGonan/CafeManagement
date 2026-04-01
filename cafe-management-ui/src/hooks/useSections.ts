import { useQuery } from '@tanstack/react-query';
import { sectionApi } from '../api/sections';

export function useSections() {
  return useQuery({
    queryKey: ['sections'],
    queryFn: () => sectionApi.getAll().then((res) => res.data),
  });
}
