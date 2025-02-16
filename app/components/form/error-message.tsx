import { get } from 'lodash-es'
import { type FormState } from 'react-hook-form'

const ErrorMessage: React.FC<{
  name: string
  formState: FormState<any>
}> = ({ name, formState }) => {
  const error = get(formState.errors, name)

  if (!error?.message) return null

  return <p className='text-sm text-destructive'>{error.message.toString() as never}</p>
}

export default ErrorMessage
