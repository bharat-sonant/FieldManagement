import { supabase } from '../../utils/supabase'
import { encrypt, decrypt } from '../../utils/crypto'

const generatePassword = () => {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const nums  = '0123456789'
  const p1 = upper[Math.floor(Math.random() * upper.length)]
  const p2 = upper[Math.floor(Math.random() * upper.length)]
  const p3 = upper[Math.floor(Math.random() * upper.length)]
  const p4 = nums[Math.floor(Math.random() * nums.length)]
  const p5 = nums[Math.floor(Math.random() * nums.length)]
  const p6 = nums[Math.floor(Math.random() * nums.length)]
  return p1 + p2 + p3 + p4 + p5 + p6
}

const toUser = async (u) => ({
  id:           u.id,
  employeeId:   u.employee_id,
  name:         u.name,
  email:        await decrypt(u.email),
  mobileNumber: await decrypt(u.mobile_number),
  status:       u.status,
  role:         u.role || 'FIELD_EXECUTIVE',
})

export const fetchUserData = async (setSelectedUser, setUsers, setLoading, setActiveInactiveUserList) => {
  setLoading(true)
  try {
    const { data, error } = await supabase
      .from('FieldExecutives')
      .select('*')
      .order('name', { ascending: true })

    if (error) { setUsers([]); setSelectedUser(null); return }

    const results  = await Promise.allSettled(data.map(toUser))
    const userList = results.filter((r) => r.status === 'fulfilled').map((r) => r.value)
    setUsers(userList)

    const activeInactive = userList.filter((u) => u.status === 'ACTIVE' || u.status === 'INACTIVE')
    setActiveInactiveUserList(activeInactive)

    const sortedActive = [...userList]
      .filter((u) => u.status === 'ACTIVE')
      .sort((a, b) => a.name.localeCompare(b.name))
    setSelectedUser(sortedActive[0] || null)
  } catch {
    setUsers([])
    setSelectedUser(null)
  } finally {
    setLoading(false)
  }
}

export const addUser = async (formData, setLoading, onSuccess, onError) => {
  setLoading(true)
  try {
    const plainPassword = generatePassword()

    const { data, error } = await supabase
      .from('FieldExecutives')
      .insert({
        employee_id:   formData.empId,
        name:          formData.name,
        email:         await encrypt(formData.email),
        mobile_number: await encrypt(formData.mobile),
        password:      await encrypt(plainPassword),
        status:        'ACTIVE',
      })
      .select()
      .single()

    if (error) { onError(error.message); return }

    await fetch(import.meta.env.VITE_MAIL_API, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to:      formData.email,
        subject: 'Welcome to D2D - Your Login Credentials',
        html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
  <div style="background-color: #1a73e8; padding: 24px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Welcome to Field Management</h1>
    <p style="color: #d0e8ff; margin: 6px 0 0;">Field Executive Registration</p>
  </div>
  <div style="padding: 32px 24px;">
    <p style="font-size: 15px; color: #333;">Dear <strong>${formData.name}</strong>,</p>
    <p style="font-size: 14px; color: #555;">You have been successfully registered as a Field Executive. Below are your login credentials:</p>
    <div style="background-color: #f5f7ff; border-left: 4px solid #1a73e8; border-radius: 4px; padding: 16px 20px; margin: 24px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #777; width: 140px;">Employee ID</td>
          <td style="padding: 8px 0; font-size: 14px; color: #222; font-weight: bold;">${formData.empId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #777;">Email</td>
          <td style="padding: 8px 0; font-size: 14px; color: #222; font-weight: bold;">${formData.email}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #777;">Password</td>
          <td style="padding: 8px 0; font-size: 14px; color: #222; font-weight: bold;">${plainPassword}</td>
        </tr>
      </table>
    </div>
    <p style="font-size: 13px; color: #888;">Please keep your credentials safe. Do not share them with anyone.</p>
  </div>
  <div style="background-color: #f9f9f9; padding: 16px 24px; text-align: center; border-top: 1px solid #e0e0e0;">
    <p style="font-size: 12px; color: #aaa; margin: 0;">© 2026 D2D. All rights reserved.</p>
  </div>
</div>`,
      }),
    })

    onSuccess(await toUser(data))
  } catch {
    onError('Something went wrong')
  } finally {
    setLoading(false)
  }
}

export const updateUser = async (formData, setLoading, onSuccess, onError) => {
  setLoading(true)
  try {
    const { data, error } = await supabase
      .from('FieldExecutives')
      .update({
        name:          formData.name,
        email:         await encrypt(formData.email),
        mobile_number: await encrypt(formData.mobile),
      })
      .eq('employee_id', formData.employeeId)
      .select()
      .single()

    if (error) { onError(error.message); return }
    onSuccess(await toUser(data))
  } catch {
    onError('Something went wrong')
  } finally {
    setLoading(false)
  }
}

export const changeUserStatus = async (employeeId, currentStatus, setLoading, onSuccess, onError) => {
  setLoading(true)
  try {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'

    const { data, error } = await supabase
      .from('FieldExecutives')
      .update({ status: newStatus })
      .eq('employee_id', employeeId)
      .select()
      .single()

    if (error) { onError(error.message); return }
    onSuccess(await toUser(data))
  } catch {
    onError('Something went wrong')
  } finally {
    setLoading(false)
  }
}

export const changeUserRole = async ({ employeeId, currentRole, setLoading, onSuccess, onError }) => {
  setLoading(true)
  try {
    const newRole = currentRole === 'FIELD_EXECUTIVE' ? 'ADMIN' : 'FIELD_EXECUTIVE'

    const { data, error } = await supabase
      .from('FieldExecutives')
      .update({ role: newRole })
      .eq('employee_id', employeeId)
      .select()
      .single()

    if (error) { onError(error.message); return }
    const updated = await toUser(data)
    onSuccess({ ...updated, role: newRole })
  } catch {
    onError('Something went wrong')
  } finally {
    setLoading(false)
  }
}
