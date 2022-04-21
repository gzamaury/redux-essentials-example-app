import { createSlice } from '@reduxjs/toolkit'

const initialState = [
  { id: '0', name: 'Tianna Jenkins' },
  { id: '1', name: 'Kevin Grant' },
  { id: '2', name: 'Madison Price' },
]

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
})

export const selectUsers = (state) => state.users
export const selectUserById = (userId) => (state) =>
  state.users.find((user) => user.id === userId)

export default usersSlice.reducer
