import { client } from '../../api/client'

const {
  createSlice,
  nanoid,
  createAsyncThunk,
  createSelector,
} = require('@reduxjs/toolkit')

const initialState = {
  posts: [],
  status: 'idle',
  error: null,
}

export const addNewPost = createAsyncThunk(
  'posts/addNewPost',
  // The payload creator receives the partial `{title, content, user}` object
  async (initialPost) => {
    // We send the initial data to the fake API server
    const response = await client.post('/fakeApi/posts', initialPost)
    // The response includes the complete post object, including unique ID
    return response.data
  }
)

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  const response = await client.get('/fakeApi/posts')
  return response.data
})

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
      // @ts-ignore
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
  /* There are times when a slice reducer needs to respond to other actions that 
    weren't defined as part of this slice's reducers field. We can do that using 
    the slice extraReducers field instead. The extraReducers option should be a 
    function that receives a parameter called builder. The builder object provides 
    methods that let us define additional case reducers that will run in response 
    to actions defined outside of the slice. We'll use builder.addCase(actionCreator, 
    reducer) to handle each of the actions dispatched by our async thunks. */
  extraReducers(builder) {
    builder
      .addCase(fetchPosts.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // Add any fetched posts to the array
        state.posts = state.posts.concat(action.payload)
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(addNewPost.fulfilled, (state, action) => {
        // We can directly add the new post object to our posts array
        state.posts.push(action.payload)
      })
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

/* createSelector() takes one or more "input selector" functions as argument, plus an 
  "output selector" function. When we call selectPostsByUser(state, userId), createSelector 
  will pass all of the arguments into each of our input selectors. Whatever those input 
  selectors return becomes the arguments for the output selector. In this case, we know that 
  we need the array of all posts and the user ID as the two arguments for our output selector. 
  We can reuse our existing selectAllPosts selector to extract the posts array. Since the user 
  ID is the second argument we're passing into selectPostsByUser, we can write a small selector 
  that just returns userId.

  Our output selector then takes posts and userId, and returns the filtered array of posts for 
  just that user. If we try calling selectPostsByUser multiple times, it will only re-run the 
  output selector if either posts or userId has changed. */
export const selectPostsByUser = (userId) =>
  createSelector([selectAllPosts, (state) => userId], (posts, userId) =>
    posts.filter((post) => post.user === userId)
  )
