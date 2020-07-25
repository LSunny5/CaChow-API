const logger = require('../logger');

//validate the values entered by the user
CategoryValidate = (category) => {
	//check title of category is longer than 3 characters and less than 100
	if (category.length < 3 || category.length > 50) {
		logger.error(`Invalid category name given...`);
		return {
			error: {
				message: `Category name must be more than 3 and less than 50 characters.`
			}
		};
	}
}

module.exports = { CategoryValidate };