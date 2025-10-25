from manim import *
class create_video(Scene):
    def construct(self):
        # Title
        title = Text("Greedy Algorithm", font_size=40, color=BLUE)
        self.play(Write(title))
        self.wait(0.5)
        self.play(FadeOut(title))
        # Problem setup
        problem = Text("Coin Change Problem", font_size=32, color=WHITE).to_edge(UP)
        target_text = Text("Target: 63 cents", font_size=28, color=YELLOW).next_to(problem, DOWN)
        self.play(Write(problem))
        self.play(Write(target_text))
        self.wait(0.5)
        # Show available coins
        coins_label = Text("Available coins:", font_size=24, color=WHITE).shift(UP*1.5 + LEFT*4)
        self.play(Write(coins_label))
        coin_values = [25, 10, 5, 1]
        coin_objects = []
        coin_texts = []
        for i, value in enumerate(coin_values):
            coin = Circle(radius=0.3, color=BLUE, fill_opacity=0.7).shift(UP*0.5 + LEFT*4 + RIGHT*i*1.2)
            coin_text = Text(str(value), font_size=20, color=WHITE).move_to(coin.get_center())
            coin_objects.append(coin)
            coin_texts.append(coin_text)
            self.play(Create(coin), Write(coin_text), run_time=0.3)
        self.wait(0.5)
        # Greedy selection area
        selection_label = Text("Selected:", font_size=24, color=GREEN).shift(DOWN*0.5 + LEFT*5)
        self.play(Write(selection_label))
        # Counter for remaining
        remaining = 63
        remaining_text = Text(f"Remaining: {remaining}", font_size=24, color=YELLOW).shift(DOWN*2 + LEFT*4)
        self.play(Write(remaining_text))
        count_text = Text("Count: 0", font_size=24, color=GREEN).shift(DOWN*2 + RIGHT*2)
        self.play(Write(count_text))
        selected_coins = []
        total_count = 0
        x_offset = -3
        # Greedy algorithm execution
        for coin_idx, value in enumerate(coin_values):
            num_coins = remaining // value
            if num_coins > 0:
                # Highlight current coin
                self.play(coin_objects[coin_idx].animate.set_color(YELLOW), run_time=0.3)
                for j in range(num_coins):
                    # Create selected coin
                    selected = Circle(radius=0.25, color=GREEN, fill_opacity=0.8).shift(DOWN*0.5 + LEFT*5 + RIGHT*(x_offset + len(selected_coins)*0.6))
                    sel_text = Text(str(value), font_size=16, color=WHITE).move_to(selected.get_center())
                    self.play(Create(selected), Write(sel_text), run_time=0.2)
                    selected_coins.append(VGroup(selected, sel_text))
                    total_count += 1
                    remaining -= value
                    # Update counters
                    new_remaining = Text(f"Remaining: {remaining}", font_size=24, color=YELLOW).shift(DOWN*2 + LEFT*4)
                    new_count = Text(f"Count: {total_count}", font_size=24, color=GREEN).shift(DOWN*2 + RIGHT*2)
                    self.play(
                        Transform(remaining_text, new_remaining),
                        Transform(count_text, new_count),
                        run_time=0.2
                    )
                # Reset coin color
                self.play(coin_objects[coin_idx].animate.set_color(BLUE), run_time=0.2)
        self.wait(1)
        # Show result
        result = Text("Greedy Choice: Always pick largest coin", font_size=26, color=GREEN).shift(DOWN*3.2)
        self.play(Write(result))
        self.wait(1.5)
        # Fade all
        all_objects = [problem, target_text, coins_label, selection_label, remaining_text, count_text, result]
        all_objects.extend(coin_objects)
        all_objects.extend(coin_texts)
        all_objects.extend(selected_coins)
        self.play(*[FadeOut(obj) for obj in all_objects], run_time=1)
        # Final message
        final = Text("Greedy: Local optimal -> Global optimal", font_size=32, color=BLUE)
        self.play(Write(final))
        self.wait(1)
        self.play(FadeOut(final))