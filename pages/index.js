import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation'

import styles from '@/styles/home.module.css'
import { useState } from 'react';

export default function Home() {
  const router = useRouter()
  const [roomId, setRoomId] = useState('')

  const createAndJoin = () => {
    const roomId = uuidv4()
    router.push(`/${roomId}`)
  }

  const joinRoom = () => {
    if (roomId) router.push(`/${roomId}`)
    else {
      alert("Please provide a valid room id")
    }
  }
  return (
    <div className={styles?.main_screen}>
      <div className={styles.homeContainer}>
        <h1>Enter A Meeting</h1>
        <div className={styles.enterRoom}>
          <input placeholder='Enter Room ID' value={roomId} onChange={(e) => setRoomId(e?.target?.value)}/>
          <button onClick={joinRoom}>Join Meeting</button>
        </div>
        <span  className={styles.separatorText}> OR </span>
        <button onClick={createAndJoin}>Create a new meeting</button>
        </div>
        <div className={styles.right_container}>
        <img
      src="MeetHero.png"
      width={500}
      height={500}
      alt="Picture of the author"
    />
        </div>
    </div>
  )
}
