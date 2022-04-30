import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { client } from '../../api/client'

/* Thunk Arguments - For createAsyncThunk specifically, you can only pass in one argument, 
  and whatever we pass in becomes the first argument of the payload creation callback. The 
  second argument to our payload creator is a thunkAPI object containing several useful 
  functions and pieces of information:

  - dispatch and getState: the actual dispatch and getState methods from our Redux store. 
    You can use these inside the thunk to dispatch more actions, or get the latest Redux 
    store state (such as reading an updated value after another action is dispatched).
  - extra: the "extra argument" that can be passed into the thunk middleware when creating 
    the store. This is typically some kind of API wrapper, such as a set of functions that 
    know how to make API calls to your application's server and return data, so that your 
    thunks don't have to have all the URLs and query logic directly inside.
  - requestId: a unique random ID value for this thunk call. Useful for tracking status of 
    an individual request.
  - signal: An AbortController.signal function that can be used to cancel an in-progress 
    request.
  - rejectWithValue: a utility that helps customize the contents of a rejected action if 
    the thunk receives an error. */

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  // We can destructure the getState function out of the thunkAPI object
  async (_, { getState }) => {
    const allNotifications = selectAllNotifications(getState())
    /* Since the array of notifications is sorted newest first, we can grab the latest one 
      using array destructuring. */
    const [latestNotification] = allNotifications
    const latestTimestamp = latestNotification ? latestNotification.date : ''
    const response = await client.get(
      `/fakeApi/notifications?since=${latestTimestamp}`
    )
    return response.data
  }
)

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: [],
  reducers: {},
  extraReducers: {
    // @ts-ignore
    [fetchNotifications.fulfilled]: (state, action) => {
      state.push(...action.payload)
      // Sort with newest first
      state.sort((a, b) => b.date.localeCompare(a.date))
    },
  },
})

export default notificationsSlice.reducer

export const selectAllNotifications = (state) => state.notifications
