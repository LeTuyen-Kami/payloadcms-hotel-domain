import { getPayload } from 'payload'
import configPromise from './src/payload.config'

async function checkPosts() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    limit: 100,
  })
  console.log('Total posts found:', posts.totalDocs)
  posts.docs.forEach((p) => {
    console.log(`- ${p.title} (Status: ${p._status})`)
  })
  process.exit(0)
}

checkPosts()
