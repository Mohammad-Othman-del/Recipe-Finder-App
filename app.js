const API_BASE = 'https://www.themealdb.com/api/json/v1/1';

const form = document.querySelector('.search-bar');
const input = document.getElementById('search-input');
const results = document.getElementById('results');

// --- Helpers ---
function getIngredients(meal) {
  // TheMealDB uses strIngredient1..20 and strMeasure1..20
  const items = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`]?.trim();
    const mea = meal[`strMeasure${i}`]?.trim();
    if (ing) {
      items.push([mea, ing].filter(Boolean).join(' '));
    }
  }
  return items;
}

function getSteps(meal) {
  // Instructions are usually a long string with line breaks
  const raw = (meal.strInstructions || '').trim();
  if (!raw) return [];
  // Split on blank lines / new lines; fallback to periods if no newlines
  let parts = raw.split(/\r?\n+/).map(s => s.trim()).filter(Boolean);
  if (parts.length <= 1) {
    parts = raw.split(/(?<=\.)\s+/).map(s => s.trim()).filter(Boolean);
  }
  return parts;
}

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

  results.innerText = 'Loading…';

  try {
    const meals = await searchMeals(q);

    results.innerHTML = meals.length === 0
      ? '<p>No results found.</p>'
      : meals.map(m => {
          const ingredients = getIngredients(m);
          const steps = getSteps(m);

          return `
            <article class="meal-card">
              <img src="${m.strMealThumb}" alt="${m.strMeal}" />
              <div class="meal-body">
                <h3 class="meal-title">${m.strMeal}</h3>
                <p class="meal-meta">
                  ${m.strArea ? `<span>${m.strArea}</span>` : ''}
                  ${m.strCategory ? `<span class="dot">•</span><span>${m.strCategory}</span>` : ''}
                </p>

                <div class="meal-sections">
                  <section class="meal-ingredients">
                    <h4>Ingredients</h4>
                    <ul>
                      ${ingredients.map(i => `<li>${i}</li>`).join('')}
                    </ul>
                  </section>

                  <section class="meal-steps">
                    <details>
                      <summary>Steps to cook</summary>
                      ${
                        steps.length
                          ? `<ol>${steps.map(s => `<li>${s}</li>`).join('')}</ol>`
                          : `<p>No instructions provided.</p>`
                      }
                    </details>
                  </section>
                </div>

                <div class="meal-links">
                  ${m.strSource ? `<a href="${m.strSource}" target="_blank" rel="noopener">Source</a>` : ''}
                  ${m.strYoutube ? `<a href="${m.strYoutube}" target="_blank" rel="noopener">YouTube</a>` : ''}
                </div>
              </div>
            </article>
          `;
        }).join('');
  } catch (err) {
    console.error(err);
    results.textContent = 'Something went wrong. Please try again.';
  }
});
