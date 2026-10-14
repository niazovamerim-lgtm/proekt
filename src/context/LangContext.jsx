import React, { createContext, useContext, useState } from 'react'

const translations = {
  kg: {
    about: 'Биз жөнүндө', addresses: 'Дарек', menu: 'Меню',
    reserve: 'Резерв', catering: 'Кейтеринг', masterclass: 'Мастер-класс',
    reviews: 'Пикирлер', giftcard: 'Белек карта', auth: 'Кирүү',
    book: 'Броньдоо', addToCart: 'Себетке кош', favorites: 'Сүйүктүүлөр',
    search: 'Издөө', filterAll: 'Баары', filterHot: 'Ысык', filterCold: 'Муздак',
    filterDessert: 'Десерт', filterDrink: 'Суусундук',
    cartEmpty: 'Себет бош', total: 'Жалпы', order: 'Буйрутма бер',
    themeDay: 'Күн', themeNight: 'Түн', loading: 'Жүктөлүүдө...',
    noResults: 'Эч нерсе табылган жок',
  },
  ru: {
    about: 'О нас', addresses: 'Адреса', menu: 'Меню',
    reserve: 'Резерв', catering: 'Кейтеринг', masterclass: 'Мастер-класс',
    reviews: 'Отзывы', giftcard: 'Подарочная карта', auth: 'Вход',
    book: 'Бронь', addToCart: 'В корзину', favorites: 'Избранное',
    search: 'Поиск', filterAll: 'Все', filterHot: 'Горячие', filterCold: 'Холодные',
    filterDessert: 'Десерты', filterDrink: 'Напитки',
    cartEmpty: 'Корзина пуста', total: 'Итого', order: 'Оформить заказ',
    themeDay: 'День', themeNight: 'Ночь', loading: 'Загрузка...',
    noResults: 'Ничего не найдено',
  },
  en: {
    about: 'About', addresses: 'Addresses', menu: 'Menu',
    reserve: 'Reserve', catering: 'Catering', masterclass: 'Master Class',
    reviews: 'Reviews', giftcard: 'Gift Card', auth: 'Login',
    book: 'Book', addToCart: 'Add to Cart', favorites: 'Favorites',
    search: 'Search', filterAll: 'All', filterHot: 'Hot', filterCold: 'Cold',
    filterDessert: 'Desserts', filterDrink: 'Drinks',
    cartEmpty: 'Cart is empty', total: 'Total', order: 'Place Order',
    themeDay: 'Day', themeNight: 'Night', loading: 'Loading...',
    noResults: 'Nothing found',
  },
}

const LangContext = createContext()

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'ru')

  const t = (key) => translations[lang]?.[key] || translations.ru[key] || key

  const changeLang = (l) => {
    setLang(l)
    localStorage.setItem('lang', l)
  }

  return (
    <LangContext.Provider value={{ lang, changeLang, t, translations }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
