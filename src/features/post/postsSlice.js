const { createSlice } = require('@reduxjs/toolkit')

const initialState = [
  { id: '1', title: 'First Post!', content: 'Hello!' },
  { id: '2', title: 'Second Post', content: 'More text' },
]

const postsSlice = createSlice({
  name: 'posts',
  initialState: initialState,
  reducers: {},
})

export default postsSlice.reducer
