import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { selectAllPosts } from '../posts/postsSlice'
import { selectUserById } from './usersSlice'

export const UserPage = ({ match }) => {
  const { userId } = match.params

  const user = useSelector(selectUserById(userId))

  /* We can use the React DevTools Profiler to view some graphs of what components 
    re-render when state is updated. Try clicking over to the <UserPage> for a 
    single user. Open up your browser's DevTools, and in the React "Profiler" tab, 
    click the circle "Record" button in the upper-left. Then, click the "Refresh 
    Notifications" button in our app, and stop the recording in the React DevTools 
    Profiler. You should see that the <Navbar> re-rendered, which makes sense because 
    it had to show the updated "unread notifications" badge in the tab. But, why did 
    our <UserPage> re-render?

    We know that useSelector will re-run every time an action is dispatched, and that 
    it forces the component to re-render if we return a new reference value. We're 
    calling filter() inside of our useSelector hook, so that we only return the list 
    of posts that belong to this user. Unfortunately, this means that useSelector 
    always returns a new array reference, and so our component will re-render after 
    every action even if the posts data hasn't changed!. */
  const postsForUser = useSelector((state) => {
    const allPosts = selectAllPosts(state)
    return allPosts.filter((post) => post.user === userId)
  })

  const postTitles = postsForUser.map((post) => (
    <li key={post.id}>
      <Link to={`/posts/${post.id}`}>{post.title}</Link>
    </li>
  ))

  return (
    <section>
      <h2>{user.name}</h2>

      <ul>{postTitles}</ul>
    </section>
  )
}
