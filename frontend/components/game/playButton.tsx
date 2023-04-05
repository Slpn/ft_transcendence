import Link from "next/link";
import { motion } from "framer-motion"

const PlayButton = () => {
    return (
    <>
      <Link href={"/game"}>
          <button className="btn-play ml-8">
            <motion.div whileHover={{ scale: [null, 1.3, 1.2] }} transition={{ duration: 0.3 }}>
              <span className="home-subtitle">PLAY</span>
            </motion.div>
          </button>
      </Link>
    </>
    )
}

export default PlayButton;
