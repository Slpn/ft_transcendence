import SignForm from "../components/SignForm/SignForm";
import React from "react";
import { useState, useEffect} from 'react'
import Head from 'next/head';
import { motion } from "framer-motion"


const Home = () => {
	const [_ind, setIndex] = useState(0);
  const [x, setX] = useState(100);
  const [y, setY] = useState(0);
  const [rotate, setRotate] = useState(0);
	return (
	<>
		<main>
			<Head><title>Connect</title></Head>
			<div>
				<div className="relative">
					<div className="sticky top-0 h-screen flex flex-col items-center justify-center text-color-3 color-7">
					<motion.div
							initial={{ opacity: 0, scale: 0.5 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 1.6 }}>
						<h2 className="text-5xl font-bold">Welcome to ft_transcendence</h2>
					</motion.div>
					</div>
					{/* <div className="sticky top-0 h-screen flex flex-col items-center justify-center text-color-3 color-7">
						<motion.div
							animate={{ x, y, rotate }}
							transition={{ type: "spring" }}>
							<h2 className="text-4xl font-bold"></h2>
						</motion.div>
					</div> */}
					{/* <div className="sticky top-0 h-screen flex flex-col items-center justify-center text-color-3 color-7">
						<h2 className="text-4xl font-bold">The Third Title</h2>
					</div> */}
					<div className="sticky top-0 h-screen flex flex-col items-center justify-center color-7">
						<motion.div
							initial={{ opacity: 0, scale: 0.5 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 3 }}>
							<div className="center index-page py-20">
								<h2 className="text-4xl mb-8 font-bold text-color-3">Let's start</h2>
								<div className="welcome items-center">
									<SignForm/>
								</div>
							</div>
						</motion.div>
					</div>
				</div>
			</div>
		</main>
	</>
  );
};

export default Home;
