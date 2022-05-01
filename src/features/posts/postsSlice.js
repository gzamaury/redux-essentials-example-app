import { client } from '../../api/client'

const {
  createSlice,
  createAsyncThunk,
  createSelector,
  createEntityAdapter,
} = require('@reduxjs/toolkit')

/* "Normalized state" means that:

  - We only have one copy of each particular piece of data in our state, so there's no 
    duplication.
  - Data that has been normalized is kept in a lookup table, where the item IDs are the 
    keys, and the items themselves are the values.
  - There may also be an array of all of the IDs for a particular item type.

  JavaScript objects can be used as lookup tables, similar to "maps" or "dictionaries" 
  in other languages. Here's what the normalized state for a group of user objects might 
  look like:

  {
    users: {
      ids: ["user1", "user2", "user3"],
      entities: {
        "user1": {id: "user1", firstName, lastName},
        "user2": {id: "user2", firstName, lastName},
        "user3": {id: "user3", firstName, lastName},
      }
    }
  }

  This makes it easy to find a particular user object by its ID, without having to loop 
  through all the other user objects in an array:

  const userId = 'user2'
  const userObject = state.users.entities[userId] */

/* --- Managing Normalized State with createEntityAdapter ---
  
  Redux Toolkit's createEntityAdapter() API provides a standardized way to store your 
  data in a slice by taking a collection of items and putting them into the shape of 
  { ids: [], entities: {} }. Along with this predefined state shape, it generates a set 
  of reducer functions and selectors that know how to work with that data.

  This has several benefits:

  - We don't have to write the code to manage the normalization ourselves.
  - createEntityAdapter's pre-built reducer functions handle common cases like "add all 
    these items", "update one item", or "remove multiple items"
  - createEntityAdapter can keep the ID array in a sorted order based on the contents of 
    the items, and will only update that array if items are added / removed or the sorting 
    order changes.
  - createEntityAdapter accepts an options object that may include a sortComparer function, 
    which will be used to keep the item IDs array in sorted order by comparing two items 
    (and works the same way as Array.sort()).

  It returns an object that contains a set of generated reducer functions for adding, 
  updating, and removing items from an entity state object. These reducer functions can 
  either be used as a case reducer for a specific action type, or as a "mutating" utility 
  function within another reducer in createSlice.

  The adapter object also has a getSelectors function. You can pass in a selector that 
  returns this particular slice of state from the Redux root state, and it will generate 
  selectors like selectAll and selectById.

  Finally, the adapter object has a getInitialState function that generates an empty 
  {ids: [], entities: {}} object. You can pass in more fields to getInitialState, and 
  those will be merged in. */

const postsAdapter = createEntityAdapter({
  sortComparer: (a, b) => b.date.localeCompare(a.date),
})

const initialState = postsAdapter.getInitialState({
  status: 'idle',
  error: null,
})

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
    postUpdated(state, action) {
      const { postId, title, content } = action.payload
      const existingPost = state.entities[postId]
      if (existingPost) {
        existingPost.title = title
        existingPost.content = content
      }
    },
    reactionAdded(state, action) {
      const { postId, reaction } = action.payload
      const existingPost = state.entities[postId]
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
        // Use the `upsertMany` reducer as a mutating update utility
        postsAdapter.upsertMany(state, action.payload)
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      // Use the `addOne` reducer for the fulfilled case
      .addCase(addNewPost.fulfilled, postsAdapter.addOne)
  },
})

export const { postUpdated, reactionAdded } = postsSlice.actions

export default postsSlice.reducer

// Export the customized selectors for this adapter using `getSelectors`
const {
  selectAll: selectAllPosts,
  selectById,
  selectIds: selectPostIds,
  // Pass in a selector that returns the posts slice of state
} = postsAdapter.getSelectors((state) => state.posts)
const selectPostById = (postId) => (state) => selectById(state, postId)
export { selectAllPosts, selectPostById, selectPostIds }

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
