export async function handleFetchError(response: Response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data;
}
