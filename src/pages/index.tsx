import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <Head>
        <title>TTRPG Combat Tracker</title>
        <meta name="description" content="A combat tracker for tabletop RPGs" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="main-container">
        <div className="library-column">
          <h2>Library</h2>
          {/* Add library content here */}
        </div>
        <div className="combat-tracker-column">
          <h2>Combat Tracker</h2>
          {/* Add combat tracker content here */}
        </div>
        <div className="dice-roller-column">
          <h2>Dice Roller</h2>
          {/* Add dice roller content here */}
        </div>
      </main>
    </>
  )
}