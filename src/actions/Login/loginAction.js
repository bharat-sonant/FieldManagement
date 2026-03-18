import { supabase } from '../../utils/supabase'
import { encrypt, decrypt } from '../../utils/crypto'

export const loginUser = async (formData, setLoading, onSuccess, onError) => {
  setLoading(true)
  try {
    const encryptedEmail = await encrypt(formData.email)

    let { data: users, error } = await supabase
      .from('FieldExecutives')
      .select('*')
      .eq('email', encryptedEmail)
      .limit(1)

    if (error) { onError(error.message); return }

    if (!users || users.length === 0) {
      const { data: plainUsers, error: plainError } = await supabase
        .from('FieldExecutives')
        .select('*')
        .eq('email', formData.email)
        .limit(1)

      if (plainError) { onError(plainError.message); return }
      users = plainUsers
    }

    if (!users || users.length === 0) {
      onError('Invalid email or password')
      return
    }

    const user           = users[0]

    if (user.status === 'INACTIVE') {
      onError('Your account has been deactivated. Please contact admin.')
      return
    }

    const storedPassword = await decrypt(user.password)

    if (storedPassword !== formData.password) {
      onError('Invalid email or password')
      return
    }

    onSuccess({
      id:           user.id,
      employeeId:   user.employee_id,
      name:         user.name,
      email:        formData.email,
      mobileNumber: await decrypt(user.mobile_number),
      status:       user.status,
    })
  } catch {
    onError('Something went wrong')
  } finally {
    setLoading(false)
  }
}
