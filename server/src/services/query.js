const DEFAULT_PAGE_NUMBER = 1;
const DEFAULT_PAGE_LIMIT = 0; // 0 = no limit (returns all)
const MAX_PAGE_LIMIT = 50;

function getPagination(query) {
  const page = Math.abs(parseInt(query.page, 10)) || DEFAULT_PAGE_NUMBER;
  const rawLimit = Math.abs(parseInt(query.limit, 10)) || DEFAULT_PAGE_LIMIT;
  const limit = rawLimit > 0 ? Math.min(rawLimit, MAX_PAGE_LIMIT) : DEFAULT_PAGE_LIMIT;
  const skip = (page - 1) * limit;

  return {
    skip,
    limit,
  };
}

module.exports = {
  getPagination,
};
