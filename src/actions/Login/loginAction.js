import api from '../../utils/api'

export const loginUser = async (formData, setLoading, onSuccess, onError) => {
  try {
    setLoading(true)
    const result = await api.post(`fe-users/new-login`, {
      email:    formData.email,
      password: formData.password,
    })

    if (result?.status === 'success') {
      onSuccess(result.data)
    } else {
      onError(result?.message || 'Login failed')
    }
  } catch (error) {
    console.error('Error in login:', error)
    onError('Invalid email or password')
  } finally {
    setLoading(false)
  }
}
