```javascript
// SafeSpace prototype
// This version stores everything locally in the browser.
// It does NOT connect strangers together yet.

let username = localStorage.getItem("safespace_username") || "";

let posts = JSON.parse(localStorage.getItem("safespace_posts")) || [
  {
    id: 1,
    username: "QuietCloud",
    topic: "school",
    text: "School has been feeling really overwhelming lately. It helps knowing I'm not the only one who feels this way.",
    support: 3
  },
  {
    id: 2,
    username: "LittleSun",
    topic: "friends",
    text: "I had an argument with a friend and I'm not sure what to do next.",
    support: 5
  },
  {
    id: 3,
    username: "BlueSky",
    topic: "lonely",
    text: "Sometimes I feel lonely even when I'm around other people. Does anyone else understand that feeling?",
    support: 4
  }
];

let blockedUsers =
  JSON.parse(localStorage.getItem("safespace_blocked")) || [];

let currentTopic = "all";

const usernameInput = document.getElementById("username");
const postText = document.getElementById("postText");
const characterCount = document.getElementById("characterCount");

if (username) {
  usernameInput.value = username;
}

postText.addEventListener("input", () => {
  characterCount.textContent = `${postText.value.length} / 500`;
});

function saveUsername() {
  const value = usernameInput.value.trim();

  if (value.length < 2) {
    alert("Please choose a nickname with at least 2 characters.");
    return;
  }

  if (containsPrivateInformation(value)) {
    alert("Please choose a nickname that doesn't contain private information.");
    return;
  }

  username = value;
  localStorage.setItem("safespace_username", username);

  alert("Your pseudonym has been saved.");
}

function showCommunity() {
  document.querySelector(".hero").style.display = "none";
  document.getElementById("help").classList.add("hidden");
  document.getElementById("community").classList.remove("hidden");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  renderPosts();
}

function showHelp() {
  document.querySelector(".hero").style.display = "none";
  document.getElementById("community").classList.add("hidden");
  document.getElementById("help").classList.remove("hidden");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function filterTopic(topic, button) {
  currentTopic = topic;

  document.querySelectorAll(".topic").forEach(item => {
    item.classList.remove("active");
  });

  button.classList.add("active");

  renderPosts();
}

function createPost() {
  if (!username) {
    alert("Please choose a pseudonym first.");
    usernameInput.focus();
    return;
  }

  const text = postText.value.trim();
  const topic = document.getElementById("postTopic").value;

  if (text.length < 5) {
    alert("Please write a little more so people understand what you're sharing.");
    return;
  }

  if (containsPrivateInformation(text)) {
    alert(
      "It looks like your post may contain private information. " +
      "Please remove names, addresses, phone numbers, school names or contact details."
    );
    return;
  }

  if (containsUnsafeContent(text)) {
    alert(
      "This post contains content that needs extra care. " +
      "Please keep this community focused on support and avoid instructions or graphic details about dangerous situations."
    );
    return;
  }

  const newPost = {
    id: Date.now(),
    username: username,
    topic: topic,
    text: text,
    support: 0
  };

  posts.unshift(newPost);

  localStorage.setItem("safespace_posts", JSON.stringify(posts));

  postText.value = "";
  characterCount.textContent = "0 / 500";

  renderPosts();
}

function renderPosts() {
  const feed = document.getElementById("feed");

  const visiblePosts = posts.filter(post => {
    const topicMatches =
      currentTopic === "all" || post.topic === currentTopic;

    const notBlocked =
      !blockedUsers.includes(post.username);

    return topicMatches && notBlocked;
  });

  if (visiblePosts.length === 0) {
    feed.innerHTML = `
      <div class="post">
        <p>No posts here yet. You could be the first person to share.</p>
      </div>
    `;
    return;
  }

  feed.innerHTML = visiblePosts.map(post => `
    <article class="post">
      <div class="post-header">
        <div>
          <span class="user">${escapeHTML(post.username)}</span>
          <span class="post-topic"> · ${formatTopic(post.topic)}</span>
        </div>
      </div>

      <p class="post-text">${escapeHTML(post.text)}</p>

      <div class="post-actions">
        <button class="action" onclick="supportPost(${post.id})">
          💚 Support ${post.support}
        </button>

        <button class="action" onclick="blockUser('${escapeAttribute(post.username)}')">
          🚫 Block
        </button>

        <button class="action report" onclick="reportPost(${post.id})">
          🚩 Report
        </button>
      </div>
    </article>
  `).join("");
}

function supportPost(id) {
  const post = posts.find(item => item.id === id);

  if (!post) return;

  post.support++;

  localStorage.setItem("safespace_posts", JSON.stringify(posts));

  renderPosts();
}

function blockUser(name) {
  if (!confirm(`Block ${name}? Their posts will no longer appear for you.`)) {
    return;
  }

  if (!blockedUsers.includes(name)) {
    blockedUsers.push(name);
    localStorage.setItem(
      "safespace_blocked",
      JSON.stringify(blockedUsers)
    );
  }

  renderPosts();
}

function reportPost(id) {
  const post = posts.find(item => item.id === id);

  if (!post) return;

  const reason = prompt(
    "Why are you reporting this post?\n\n" +
    "Examples: bullying, harassment, personal information, unsafe content, spam."
  );

  if (!reason) return;

  alert(
    "Thank you for reporting this post.\n\n" +
    "In the real version, this would send the report to trained moderators for review."
  );
}

function supportMessage(type) {
  const box = document.getElementById("supportMessage");

  const messages = {
    talk:
      "You can share as much or as little as you want. You don't need to have the perfect words.",

    listen:
      "That's completely okay. Sometimes being heard is more important than getting advice.",

    advice:
      "When asking for advice, remember that other community members are peers, not professionals. For serious situations, a trusted adult or qualified professional can help.",

    ideas:
      "You could start by writing down what is bothering you, what you can control, and one small thing that might make today easier."
  };

  box.textContent = messages[type];
  box.style.display = "block";
}

function urgentHelp() {
  alert(
    "If you think you or someone else is in immediate danger, " +
    "please tell a trusted adult or contact your local emergency service now.\n\n" +
    "This community is not an emergency service."
  );
}

function containsPrivateInformation(text) {
  const lower = text.toLowerCase();

  // Phone numbers
  if (/\b\d{7,}\b/.test(text)) {
    return true;
  }

  // Email-like addresses
  if (/\S+@\S+\.\S+/.test(text)) {
    return true;
  }

  const privateWords = [
    "my address is",
    "my phone number is",
    "my password is",
    "my school is",
    "my snapchat is",
    "my instagram is",
    "my discord is"
  ];

  return privateWords.some(word => lower.includes(word));
}

function containsUnsafeContent(text) {
  const lower = text.toLowerCase();

  const riskyTerms = [
    "how to hurt",
    "how to harm",
    "instructions to hurt",
    "instructions to harm",
    "how can i attack"
  ];

  return riskyTerms.some(term => lower.includes(term));
}

function formatTopic(topic) {
  const topics = {
    school: "📚 School",
    friends: "🤝 Friends",
    family: "🏠 Family",
    stress: "🌧️ Stress",
    lonely: "💭 Feeling lonely"
  };

  return topics[topic] || "🌎 Community";
}

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function escapeAttribute(text) {
  return text.replace(/'/g, "\\'");
}

// Initial display
renderPosts();
```
