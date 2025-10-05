
const form = document.querySelector('.search-bar');
const input = document.getElementById('search-input');
const results = document.getElementById('results');

// Fetching Meals
async function searchMeals(query) {
  const res = await fetch(`${API_BASE}/search.php?s=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Network error');
  const data = await res.json();       // { meals: [...] | null }
  return data.meals || [];             // always return an array
}

// Event listeners
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const q = input.value.trim();
  if (!q) return;

  // Optional loading state
  results.textContent = 'Loading…';

  try {
    const meals = await searchMeals(q); // <- call your API helper

    // Render something simple for now
    results.innerHTML = meals.length === 0
      ? '<p>No results found.</p>'
      : meals.map(m => `
          <article class="meal-card">
            <img src="${m.strMealThumb}" alt="${m.strMeal}" />
            <h3>${m.strMeal}</h3>
            <p>${m.strArea || ''}${m.strCategory ? ` · ${m.strCategory}` : ''}</p>
          </article>
        `).join('');
  } catch (err) {
    console.error(err);
    results.textContent = 'Something went wrong. Please try again.';
  }
});
