import { useState, useCallback, useRef } from 'react';
import type { SelectOption } from '../api-generated/models/selectOption';

type FetchFn<P = void> = P extends void
  ? (params?: { keyword?: string }) => Promise<{ data?: SelectOption[] | null }>
  : (params?: P & { keyword?: string }) => Promise<{ data?: SelectOption[] | null }>;

/**
 * Hook cho phép tìm kiếm trong dropdown Select với debounce.
 *
 * @param fetchFn   Hàm gọi API select-options (nhận object params có keyword)
 * @param defaultParams Tham số mặc định ngoài keyword (vd: { idPhongBan: 1 })
 * @param debounceMs Thời gian debounce mặc định 400ms
 */
export function useSearchableSelect<P extends Record<string, unknown> = Record<string, never>>(
  fetchFn: (params?: Partial<P> & { keyword?: string }) => Promise<{ data?: SelectOption[] | null }>,
  defaultParams?: Partial<P>,
  debounceMs = 400,
) {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Gọi ngay (không debounce) – dùng khi mở modal */
  const fetchOptions = useCallback(
    async (keyword?: string) => {
      setLoading(true);
      try {
        const res = await fetchFn({ ...defaultParams, keyword } as any);
        setOptions(res.data ?? []);
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetchFn, JSON.stringify(defaultParams)],
  );

  /** Gọi với debounce – dùng trong onSearch của Select */
  const handleSearch = useCallback(
    (keyword: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        fetchOptions(keyword);
      }, debounceMs);
    },
    [fetchOptions, debounceMs],
  );

  const reset = useCallback(() => setOptions([]), []);

  return { options, loading, fetchOptions, handleSearch, reset, setOptions };
}
