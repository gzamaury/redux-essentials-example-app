const { createSlice, nanoid } = require('@reduxjs/toolkit')

const initialState = [
  { id: '1', title: 'First Post!', content: 'Hello!' },
  { id: '2', title: 'Second Post', content: 'More text' },
]

const postsSlice = createSlice({
  name: 'posts',
  initialState: initialState,
  reducers: {
    /* Inside of the reducers field, we can define an object 
      that looks like {reducer, prepare} */
    postAdded: {
      reducer(state, action) {
        state.push(action.payload)
      },
      /* createSlice lets us define a "prepare callback" function that can take
        multiple arguments, generate random values like unique IDs, and run synchronous
        logic and decide what values go into the action object. It should then return
        an object with the payload field inside. (The return object may also contain a
        meta field, which can be used to add extra descriptive values to the action, and
        an error field, which should be a boolean indicating whether this action 
        represents some kind of an error.) */
      prepare(title, content) {
        return {
          payload: {
            id: nanoid(),
            title,
            content,
          },
        }
      },
    },
    postUpdated(state, action) {
      const { id, title, content } = action.payload
      const existingPost = state.find((post) => post.id === id)
      if (existingPost) {
        existingPost.title = title
        existingPost.content = content
      }
    },
  },
})

export const { postAdded, postUpdated } = postsSlice.actions

export const selectPosts = (state) => state.posts
export const selectPostById = (postId) => (state) =>
  state.posts.find((post) => post.id === postId)

export default postsSlice.reducer
