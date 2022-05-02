import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from '@reduxjs/toolkit'
import { client } from '../../api/client'

const usersAdapter = createEntityAdapter()

const initialState = usersAdapter.getInitialState()

export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const response = await client.get('/fakeApi/users')
  return response.data
})

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(fetchUsers.fulfilled, usersAdapter.setAll)
  },
})

const {
  selectAll: selectAllUsers,
  selectById,
  selectIds: selectUserIds,
} = usersAdapter.getSelectors((state) => state.users)
const selectUserById = (userId) => (state) => selectById(state, userId)
export { selectAllUsers, selectUserById, selectUserIds }

//export const selectAllUsers = (state) => state.users
//export const selectUserById = (userId) => (state) =>
//  state.users.find((user) => user.id === userId)

export default usersSlice.reducer
