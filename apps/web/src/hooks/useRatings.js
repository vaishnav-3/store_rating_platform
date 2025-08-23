import { useState, useEffect } from "react";
import ratingService from "../services/ratingService";

export const useRatings = (userId) => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRatings = async () => {
    console.log('=== useRatings fetchRatings DEBUG ===');
    console.log('userId:', userId);
    
    if (!userId) {
      console.log('No userId provided, skipping fetch');
      return;
    }

    try { 
      setLoading(true);
      setError(null);
      
      console.log('Calling ratingService.getUserRatings with userId:', userId);
      const response = await ratingService.getUserRatings(userId);
      console.log('Raw API response:', response);
      
      // Backend returns { ratings: [...], pagination: {...} }
      // Extract the ratings array from the response
      let ratingsArr = response?.ratings || response?.data || response;
      console.log('Processed ratingsArr:', ratingsArr);
      
      if (!Array.isArray(ratingsArr)) {
        console.log('ratingsArr is not an array, defaulting to empty array');
        ratingsArr = [];
      }
      
      console.log('Final ratings to set:', ratingsArr);
      setRatings(ratingsArr);
    } catch (err) {
      console.error('Error fetching ratings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useRatings useEffect triggered with userId:', userId);
    fetchRatings();
  }, [userId]);

  const submitRating = async (ratingData) => {
    try {
      setError(null);
      await ratingService.submitRating(ratingData);
      await fetchRatings(); // Refetch ratings
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const updateRating = async (id, ratingData) => {
    try {
      setError(null);
      await ratingService.updateRating(id, ratingData);
      await fetchRatings(); // Refetch ratings
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const deleteRating = async (id) => {
    try {
      setError(null);
      // Mock delete
      await new Promise((resolve) => setTimeout(resolve, 500));
      setRatings((prev) => prev.filter((rating) => rating.id !== id));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return {
    ratings,
    loading,
    error,
    submitRating,
    updateRating,
    deleteRating,
    refetch: fetchRatings,
  };
};