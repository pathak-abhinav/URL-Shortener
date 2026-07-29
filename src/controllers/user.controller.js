const { getUserUrlsService, deleteUserUrlService } = require("../services/user.service");

const getUserUrlsController = async (req, res) => {
   const userId = req.user.userId;
   const {page, startIndex, limit} = req.pagination;
   try {
   console.log("Decoded user in GET /urls:", req.user);
    const { urls, total} = await getUserUrlsService(userId, {startIndex, limit});
    res.status(200).json({ 
      result: urls,
      pagination: {
         page,
         limit,
         total,
         totalPages: Math.ceil(total / limit),
       },
    });
   } catch (err) {
    console.error("Error fetching user URLs:", err);
    res.status(500).json({ error: "Failed to fetch URLs" });
   }
   
}

const deleteUserUrlController = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    try {
     const result = await deleteUserUrlService( id,userId);
     res.status(200).json({ msg: "successfully deleted" });
    } catch (err) {
     res.status(404).json({ error: err.message });
    }
    
 }

 const logoutController = (req,res) => {
    res.clearCookie("authToken", {
        httpOnly: true,
        sameSite: "strict",
      });
    
      res.status(200).json({ message: "Logged out successfully" });
 }


module.exports = {getUserUrlsController, deleteUserUrlController, logoutController};