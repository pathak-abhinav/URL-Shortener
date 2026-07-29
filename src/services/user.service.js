const { UrlStore } = require("../database/mongodb/url-model");

const getUserUrlsService = async (userId, { startIndex, limit }) => {
	const [urls, total] = await Promise.all([
		UrlStore.find({ userId })
			.sort({ createdAt: -1 })
			.skip(startIndex)
			.limit(limit)
			.exec(),
		UrlStore.countDocuments({ userId }),
	]);
	return { urls, total };
};

const deleteUserUrlService = async (id, userId)=>{
    const url = await UrlStore.findOne({ _id: id, userId });
    if(!url) throw new Error("url not found");

    await UrlStore.deleteOne({ _id: id, userId });
 }

module.exports = { getUserUrlsService, deleteUserUrlService };
