const chalk = await import('chalk');
import dotenv from "dotenv";
import app from "./app/app.js";
import connectDB from "./config/db.js";

dotenv.config();

connectDB()
	.then(() => {
		console.log(`🚀 [Startup Success]: Database connected successfully! Server is starting...`);
		app.listen(process.env.PORT || 3000, () => {
			console.log(`🌐 [Server Running]: Application is live on ${chalk.default.blue(`http://${process.env.HOST}:${process.env.PORT}`)}`);
		});
	})
	.catch((error) => {
		console.error(`❌ [Startup Error]: Unable to start the server due to database connection issues. Error: ${error.message}`);
	});
