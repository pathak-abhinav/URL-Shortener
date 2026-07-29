const paginatedUrls = (req, res, next) => {
	try {
		const page = Math.max(1, parseInt(req.query.page, 10) || 1);
		const limit = Math.min(50, parseInt(req.query.limit, 10) || 10);
		const startIndex = (page - 1) * limit;

		req.pagination = {
			page,
			limit,
			startIndex,
		};
		next();
	} catch (error) {
		next(error);
	}
};

module.exports = paginatedUrls;
