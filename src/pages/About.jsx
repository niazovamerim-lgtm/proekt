import React from 'react'
import './About.css'

export default function About() {
  return (
    <div className="page-bg">
      <div className="page-content">
        <h1 className="page-title">История ресторана</h1>
        <div className="page-title-divider" />

        <h2 className="about__subtitle">Наша История: Как Родился «Рестик»</h2>

        <div className="about__body">
          {/* Левая колонка — текст */}
          <div className="about__text-col">
            <section className="about__section">
              <h3 className="section-heading">Начало</h3>
              <p className="about__paragraph">
                В 2018 году, в самом сердце Санкт-Петербурга на Малой Садовой, двое друзей детства —
                Алексей и Марина — открыли ресторан, о котором мечтали долгие годы.
              </p>
            </section>

            <section className="about__section">
              <h3 className="section-heading">С чего всё началось</h3>
              <p className="about__paragraph">
                Их общее видение: страсть к изысканной кухне, проверенные рецепты с местными
                ингредиентами, идеальные шефы и место, где каждый гость чувствует себя желанным
                и особенным.
              </p>
              <p className="about__paragraph">
                В ранние дни команда постепенно нашла своё место в городе. Марина и Алексей вложили
                всю душу, чтобы воплотить философию ресторана — уют, домашность и высокое искусство
                кулинарии.
              </p>
            </section>

            <section className="about__section">
              <h3 className="section-heading">Наши ценности</h3>
              <p className="about__paragraph">
                Каждое блюдо — это история. Мы используем только свежие сезонные продукты
                от местных фермеров, создавая меню, которое меняется вместе с природой.
              </p>
              <p className="about__paragraph">
                За эти годы «Рестик» стал больше, чем рестораном — это место встреч, праздников
                и тёплых воспоминаний для сотен семей по всему городу.
              </p>
            </section>
          </div>

          {/* Правая колонка — фото */}
          <div className="about__photo-col">
            <div className="about__photo-frame">
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80"
                alt="Ресторан Рестик"
                className="about__photo"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
