import { Titlebar } from './components/Titlebar'

function App(): React.JSX.Element {
  return (
    <div className="h-screen flex flex-col">
      <Titlebar title="Leaguedex" />
      <div className="flex-1 p-4">
        <h1 className="text-3xl font-bold underline">Hello world!</h1>
      </div>
    </div>
  )
}

export default App
