import { useState, useEffect } from 'react'
import './index.css'
const CheckInternetConnection = (props) => {
  // state variable holds the state of the internet connection
  const [isOnline, setOnline] = useState(true)

  // On initization set the isOnline state.
  useEffect(() => {
    setOnline(navigator.onLine)
  }, [])

  // event listeners to update the state
  window.addEventListener('online', () => {
    setOnline(true)
  })

  window.addEventListener('offline', () => {
    setOnline(false)
  })

  // if user is online, return the child component else return a custom component
  if (isOnline) {
    return props.children
  } else {
    return (
      <div className="wrapper">
        <h1>OFFLINE</h1>
        <h4>Please check your internet connection</h4>

        <a href="." className="button">
          RETRY
        </a>
      </div>
    )
  }
}

export default CheckInternetConnection
