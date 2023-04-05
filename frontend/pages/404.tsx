import Link from 'next/link'
import Head from 'next/head'
import Footer from '../components/menu&footer/footer'
import xavier from '../public/images/xavier.png'
import Image from 'next/image'

export default function FourOhFour() {
  return (
	<>
	<Head><title>404</title></Head>
	<div className="page">
		<div className="mr-4 form-404 m-10">
			<div className="flex justify-center items-center">
				<h1>Erreur 404</h1>
			</div>
			<br></br>
			<div className="flex justify-center items-center">
				<Image className="img-404"
				src={xavier} 
				alt="404"/>
			</div>
			<br></br>
			<div className="flex justify-center items-center">
				<svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M9 20H7C5.89543 20 5 19.1046 5 18V10.9199C5 10.336 5.25513 9.78132 5.69842 9.40136L10.6984 5.11564C11.4474 4.47366 12.5526 4.47366 13.3016 5.11564L18.3016 9.40136C18.7449 9.78132 19 10.336 19 10.9199V18C19 19.1046 18.1046 20 17 20H15M9 20V14C9 13.4477 9.44772 13 10 13H14C14.5523 13 15 13.4477 15 14V20M9 20H15" stroke="#464455" strokeLinecap="round" strokeLinejoin="round"/>
				</svg>
				<Link href="/home"><h1>Retourner a la maison</h1></Link>
			</div>
		</div>
	</div>
	<Footer></Footer>
  </>
)

}