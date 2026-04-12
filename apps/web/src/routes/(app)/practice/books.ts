export interface PublicDomainBook {
    id: string;
    title: string;
    author: string;
    excerpt: string;
  }
  
  export const FAMOUS_BOOKS: PublicDomainBook[] = [
    {
      id: "alice-in-wonderland",
      title: "Alice's Adventures in Wonderland",
      author: "Lewis Carroll",
      excerpt: "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, \"and what is the use of a book,\" thought Alice \"without pictures or conversation?\""
    },
    {
      id: "frankenstein",
      title: "Frankenstein",
      author: "Mary Shelley",
      excerpt: "It is with considerable difficulty that I remember the original era of my being: all the events of that period appear confused and indistinct. A strange multiplicity of sensations seized me, and I saw, felt, heard, and smelt at the same time; and it was, indeed, a long time before I learned to distinguish between the operations of my various senses."
    },
    {
      id: "moby-dick",
      title: "Moby Dick",
      author: "Herman Melville",
      excerpt: "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation."
    },
    {
        id: "pride-and-prejudice",
        title: "Pride and Prejudice",
        author: "Jane Austen",
        excerpt: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters."
    },
    {
        id: "tale-of-two-cities",
        title: "A Tale of Two Cities",
        author: "Charles Dickens",
        excerpt: "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair, we had everything before us, we had nothing before us, we were all going direct to Heaven, we were all going direct the other way."
    },
    {
        id: "dracula",
        title: "Dracula",
        author: "Bram Stoker",
        excerpt: "I was not able to light on any map or work giving the exact locality of the Castle Dracula, as there are no maps of this country as yet to compare with our own Ordnance Survey Maps; but I found that Bistritz, the post town named by Count Dracula, is a fairly well-known place. I shall enter here some of my notes, as they may refresh my memory when I talk over my travels with Mina."
    }
  ];
