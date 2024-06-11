let localized_data = {};

export async function setLocale(locale,default_locale){
    console.log("trying locale: ",locale)
    let values = await tryLocale(locale)

    if (!values){
        // we could not find the locale.. try again...
        // if the locale has an _ get the first part
        locale = locale.split("-")[0]
        console.log("trying locale: ",locale)
        values = await tryLocale(locale)
    }
    if (!values){
        // fall back to the default
        console.log("trying locale: ",default_locale)
        values = await tryLocale(default_locale)
    }
    localized_data = values;
}

async function tryLocale(locale){
    let response =  await fetch(`locales/${locale}.json`);
    console.log(response.ok)
    if (response.ok){
        return response.json()
    } 
    return false
}

(async function(){
    let locale = navigator.language || navigator.languages[0]
    await setLocale(locale,"en")
})()

export function getLocalizedString(key){
    return localized_data[key]
}