
CREATE TYPE public.review_item_status AS ENUM ('done', 'partial', 'blocked');

CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  sprint_label TEXT NOT NULL,
  team TEXT,
  review_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO anon, authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read reviews" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can insert reviews" ON public.reviews FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public can update reviews" ON public.reviews FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete reviews" ON public.reviews FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE public.review_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  status public.review_item_status NOT NULL DEFAULT 'done',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX review_items_review_id_idx ON public.review_items(review_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.review_items TO anon, authenticated;
GRANT ALL ON public.review_items TO service_role;
ALTER TABLE public.review_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read items" ON public.review_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can insert items" ON public.review_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public can update items" ON public.review_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete items" ON public.review_items FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE public.review_feedbacks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.review_items(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX review_feedbacks_item_id_idx ON public.review_feedbacks(item_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.review_feedbacks TO anon, authenticated;
GRANT ALL ON public.review_feedbacks TO service_role;
ALTER TABLE public.review_feedbacks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read feedbacks" ON public.review_feedbacks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can insert feedbacks" ON public.review_feedbacks FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public can update feedbacks" ON public.review_feedbacks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete feedbacks" ON public.review_feedbacks FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE public.review_decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX review_decisions_review_id_idx ON public.review_decisions(review_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.review_decisions TO anon, authenticated;
GRANT ALL ON public.review_decisions TO service_role;
ALTER TABLE public.review_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read decisions" ON public.review_decisions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can insert decisions" ON public.review_decisions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public can update decisions" ON public.review_decisions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete decisions" ON public.review_decisions FOR DELETE TO anon, authenticated USING (true);
