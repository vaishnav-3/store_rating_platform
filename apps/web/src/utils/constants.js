export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  STORE_OWNER: 'store_owner'
};

export const API_BASE_URL = 'https://storerate.up.railway.app/api';

export const RATING_STARS = [1, 2, 3, 4, 5];

export const PAGINATION_LIMITS = {
  USERS: 10,
  STORES: 12,
  RATINGS: 20
};

export const VALIDATION_RULES = {
  NAME: {
    MIN: 10,
    MAX: 60
  },
  ADDRESS: {
    MAX: 400
  },
  PASSWORD: {
    MIN: 8,
    MAX: 16,
    PATTERN: /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{8,16}$/
  }
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};
