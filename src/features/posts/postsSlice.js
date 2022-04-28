const { createSlice, nanoid } = require('@reduxjs/toolkit')

const initialState = {
  posts: [],
  status: 'idle',
  error: null,
}

const postsSlice = createSlice({
  name: 'posts',
  initialState: initialState,
  reducers: {
    /* Inside of the reducers field, we can define an object 
      that looks like {reducer, prepare} */
    postAdded: {
      reducer(state, action) {
        state.posts.push(action.payload)
      },
      /* createSlice lets us define a "prepare callback" function that can take
        multiple arguments, generate random values like unique IDs, and run synchronous
        logic and decide what values go into the action object. It should then return
        an object with the payload field inside. (The return object may also contain a
        meta field, which can be used to add extra descriptive values to the action, and
        an error field, which should be a boolean indicating whether this action 
        represents some kind of an error.) */
      prepare(title, content, userId) {
        return {
          payload: {
            id: nanoid(),
            date: new Date().toISOString(),
            title,
            content,
            reactions: {
              thumbsUp: 0,
              hooray: 0,
              heart: 0,
              rocket: 0,
              eyes: 0,
            },
            user: userId,
          },
        }
      },
    },
    postUpdated(state, action) {
      const { id, title, content } = action.payload
      const existingPost = state.posts.find((post) => post.id === id)
      if (existingPost) {
        existingPost.title = title
        existingPost.content = content
      }
    },
    reactionAdded(state, action) {
      const { postId, reaction } = action.payload
      const existingPost = state.posts.find((post) => post.id === postId)
      if (existingPost) {
        existingPost.reactions[reaction]++
      }
    },
  },
})

export const { postAdded, postUpdated, reactionAdded } = postsSlice.actions

export default postsSlice.reducer

/* We define reusable selector functions in the slice files, and have the components 
  use those selectors to extract the data they need instead of repeating the selector
  logic in each component. That way, if we do change our state structure again, we only 
  need to update the code in the slice file. */
export const selectAllPosts = (state) => state.posts.posts
export const selectPostById = (postId) => (state) =>
  state.posts.posts.find((post) => post.id === postId)
