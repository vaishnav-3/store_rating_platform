import { useState, useEffect } from 'react';
import storeService from '../services/storeService';
import { debounce } from '../utils/helpers';

export const useStores = (initialParams = {}) => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 12,
  });

  const fetchStores = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Combine initial params + dynamic params
      const response = await storeService.getAllStores({
        ...initialParams,
        ...params,
      });

      // Handle response structure
      const storesData = response?.data?.stores || response?.stores || [];
      const paginationData = response?.data?.pagination || response?.pagination;

      setStores(storesData);
      setPagination(paginationData || {
        currentPage: params.page || 1,
        totalPages: 1,
        totalItems: storesData.length,
        itemsPerPage: params.limit || 12,
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch stores');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search to avoid frequent API calls
  const debouncedSearch = debounce(async (query) => {
    console.log('=== SEARCH DEBUG ===');
    console.log('Search query:', query);
    
    if (!query || query.trim() === '') {
      console.log('Empty query, fetching all stores');
      // If search is empty, fetch all stores
      fetchStores();
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Search both name and address using the same query
      const searchParams = { 
        name: query.trim(),
        address: query.trim()
      };
      
      console.log('Search params:', searchParams);
      console.log('Calling storeService.searchStores with:', searchParams);
      
      const response = await storeService.searchStores(searchParams);
      
      console.log('Search response:', response);

      // Handle response structure - your backend returns { data: { stores: [...] } }
      const storesData = response?.data?.stores || response?.stores || [];
      const paginationData = response?.data?.pagination || response?.pagination;

      console.log('Extracted stores:', storesData);
      console.log('Extracted pagination:', paginationData);

      setStores(storesData);
      setPagination(paginationData || {
        currentPage: 1,
        totalPages: 1,
        totalItems: storesData.length,
        itemsPerPage: 12,
      });
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to search stores');
      // On search error, show empty results
      setStores([]);
      setPagination({
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 12,
      });
    } finally {
      setLoading(false);
    }
  }, 500);

  const searchStores = (query) => {
    debouncedSearch(query);
  };

  const refetch = (params = {}) => {
    fetchStores(params);
  };

  useEffect(() => {
    fetchStores();
    // Cleanup debounce on unmount
    return () => debouncedSearch.cancel && debouncedSearch.cancel();
  }, []);

  return {
    stores,
    loading,
    error,
    pagination,
    refetch, 
    searchStores,
  };
};