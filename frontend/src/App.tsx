import { Button } from '@mui/material'

function App() {
  const handleClick = () => {
    console.log('Button clicked!')
  }

  return (
    <div>
      <h1>Click the button.</h1>
      <Button variant="contained" onClick={handleClick}>
        Click Me. I won't explode
      </Button>
    </div>
  )
}

export default App