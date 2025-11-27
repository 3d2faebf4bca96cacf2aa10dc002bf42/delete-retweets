// Delete retweets from Twitter/X with human-like behavior

const config = {
  minDelay: 1500,
  maxDelay: 4500,
  scrollDelay: 2000,
  maxRetweets: null,
}

let deletedCount = 0

function randomDelay(min = config.minDelay, max = config.maxDelay) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function waitForElement(selector, timeout = 3000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    const checkElement = () => {
      const element = document.querySelector(selector)
      if (element) {
        resolve(element)
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Element not found: ${selector}`))
      } else {
        setTimeout(checkElement, 100)
      }
    }
    checkElement()
  })
}

function findRetweetedPosts() {
  return Array.from(document.querySelectorAll('button[data-testid="unretweet"]'))
}

async function deleteOneRetweet(unretweetButton) {
  try {
    console.log(`Deleting retweet #${deletedCount + 1}...`)

    unretweetButton.scrollIntoView({ behavior: "smooth", block: "center" })
    await new Promise((resolve) => setTimeout(resolve, randomDelay(300, 700)))

    unretweetButton.click()

    await new Promise((resolve) => setTimeout(resolve, randomDelay(500, 1000)))

    const confirmButton = document.querySelector('div[data-testid="unretweetConfirm"]')

    if (!confirmButton) {
      // Fallback: click first menu item
      const menuItems = document.querySelectorAll('div[role="menu"] div[role="menuitem"]')
      if (menuItems.length > 0) {
        menuItems[0].click()
      } else {
        console.log("Confirmation button not found")
        return false
      }
    } else {
      confirmButton.click()
    }

    await new Promise((resolve) => setTimeout(resolve, randomDelay(800, 1500)))

    deletedCount++
    console.log(`Retweet deleted. Total: ${deletedCount}`)
    return true
  } catch (error) {
    console.log(`Error deleting retweet: ${error.message}`)
    return false
  }
}

async function scrollPage() {
  window.scrollBy(0, window.innerHeight)
  await new Promise((resolve) => setTimeout(resolve, config.scrollDelay))
}

async function startDeletingRetweets() {
  console.log("Starting retweet deletion...")

  let scrollsWithoutNew = 0
  const maxScrollsWithoutNew = 3

  while (true) {
    const retweets = findRetweetedPosts()

    if (retweets.length === 0) {
      scrollsWithoutNew++

      if (scrollsWithoutNew >= maxScrollsWithoutNew) {
        console.log(`Complete. Total deleted: ${deletedCount}`)
        break
      }

      console.log("No retweets found. Scrolling...")
      await scrollPage()
      continue
    }

    scrollsWithoutNew = 0
    await deleteOneRetweet(retweets[0])

    if (config.maxRetweets && deletedCount >= config.maxRetweets) {
      console.log(`Limit reached. Total: ${deletedCount}`)
      break
    }

    // Human-like delay between actions
    if (retweets.length > 1) {
      const nextDelay = randomDelay()
      await new Promise((resolve) => setTimeout(resolve, nextDelay))
    } else {
      await scrollPage()
    }
  }
}

startDeletingRetweets()
