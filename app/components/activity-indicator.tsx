import { ImSpinner } from 'react-icons/im'

const ActivityIndicator = () => {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <ImSpinner className="w-10 h-10 animate-spin" />
    </div>
  )
}

export default ActivityIndicator